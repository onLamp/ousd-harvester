// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

interface IERC20 {
    function balanceOf(address account) external view returns (uint);
}

interface harvester { 
    function harvestAndSwap(address, address) external;
}

contract harvester_helper {

    function getCallReward(address _token, address _target, bytes calldata _targetdata, address _balanceaddy) external returns (uint256) {
        uint256 startingBalance = IERC20(_token).balanceOf(_balanceaddy);

        (bool _success, bytes memory _response) = _target.call(_targetdata);
        require(_success, "fail");

        return IERC20(_token).balanceOf(_balanceaddy) - startingBalance;
    }

    // 00000000 function selector to save gas
    function randallAteMySandwich_dbohban(uint256 _minBalance, address _strategy) public payable {
        harvester(0x21Fb5812D70B3396880D30e90D9e5C1202266c89).harvestAndSwap(_strategy, tx.origin);
        require(IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7).balanceOf(tx.origin) >= _minBalance, "not min");
    }

}